import React, { useMemo, useState } from 'react';
import { Table, Button, Input, Popconfirm, Modal, Form, Toast } from '@douyinfe/semi-ui';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconDelete,
  IconFolder,
} from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import MainLayout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { getProjects, deleteProject, createProject, Project } from '../../api/projects';
import { getBusinesses } from '../../api/businesses';
import { isValidEmail } from '../../utils/validators';
import './index.scss';

const { Column } = Table;
const DEFAULT_PROJECT_CODE = 'orangehome';
const normalizeCollaborators = (value?: string[]) =>
  Array.from(new Set((value || []).map((item) => item.trim()).filter(Boolean)));
const formatDateTime = (value?: string | number | Date) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formApi, setFormApi] = useState<any>(null);
  const ownerEmail = user?.email?.trim() || '';

  const { data, isLoading, mutate } = useSWR(
    ['projects', page, limit, search],
    () => getProjects({ page, limit, search }),
    { keepPreviousData: true }
  );
  const { data: businessData, error: businessError, isLoading: businessLoading } = useSWR(
    ['businesses', 'all'],
    () => getBusinesses({ page: 1, limit: 100 }),
    { revalidateOnFocus: false }
  );

  const businessOptions = useMemo(
    () =>
      (businessData?.data || []).map((business) => ({
        label: business.businessName,
        value: business.id,
      })),
    [businessData]
  );

  const handleOpenCreate = () => {
    setCreateVisible(true);
    formApi?.setValues({
      projectName: '',
      businessId: '',
      owner: ownerEmail,
      collaborators: [],
      description: '',
    });
  };

  const handleCloseCreate = () => {
    setCreateVisible(false);
    formApi?.reset();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      Toast.success(t('projects.deleteSuccess'));
      mutate();
    } catch (err: any) {
      Toast.error(err.message || t('projects.deleteFailed'));
    }
  };

  const handleCreate = async (values: {
    projectName: string;
    businessId: string;
    owner?: string;
    collaborators?: string[];
    description?: string;
  }) => {
    const collaborators = normalizeCollaborators(values.collaborators).filter((email) => email !== ownerEmail);

    if (!ownerEmail) {
      Toast.error(t('projects.noOwnerEmail'));
      return;
    }

    if (!isValidEmail(ownerEmail)) {
      Toast.error(t('projects.ownerEmailInvalid'));
      return;
    }

    const invalidCollaborator = collaborators.find((email) => !isValidEmail(email));
    if (invalidCollaborator) {
      Toast.error(t('projects.validation.collaboratorItemInvalid', { email: invalidCollaborator }));
      return;
    }

    setCreating(true);
    try {
      await createProject({
        projectCode: DEFAULT_PROJECT_CODE,
        projectName: values.projectName.trim(),
        businessId: values.businessId.trim(),
        owner: ownerEmail,
        collaborators,
        description: values.description?.trim() || undefined,
      });
      Toast.success(t('projects.createSuccess'));
      handleCloseCreate();
      mutate();
    } catch (err: any) {
      Toast.error(err.message || t('projects.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  const isTrulyEmpty =
    !isLoading && data !== undefined && (data.total ?? 0) === 0;
  const showOnboarding = isTrulyEmpty && !search.trim();
  const showSearchEmpty = isTrulyEmpty && !!search.trim();

  const renderActions = (record: Project) => (
    <div className="action-buttons">
      <Button
        icon={<IconEdit />}
        theme="borderless"
        onClick={() => navigate(`/projects/${record.id}`)}
      >
        {t('projects.detail')}
      </Button>
      <Popconfirm
        title={t('projects.confirmDelete')}
        content={t('projects.confirmDeleteContent', { name: record.projectName })}
        onConfirm={() => handleDelete(record.id)}
      >
        <Button icon={<IconDelete />} theme="borderless" type="danger">
          {t('common.delete')}
        </Button>
      </Popconfirm>
    </div>
  );

  return (
    <MainLayout>
      <div className="projects-page">
        <div className="page-header">
          <h1>{t('projects.pageTitle')}</h1>
          <Button icon={<IconPlus />} type="primary" theme="solid" onClick={handleOpenCreate}>
            {t('projects.newProject')}
          </Button>
        </div>

        {showOnboarding ? (
          <div className="projects-empty-hero">
            <div className="projects-empty-hero__orb" aria-hidden />
            <div className="projects-empty-hero__icon-wrap">
              <IconFolder />
            </div>
            <h2 className="projects-empty-hero__title">{t('projects.emptyHeroTitle')}</h2>
            <p className="projects-empty-hero__lead">{t('projects.emptyHeroLead')}</p>
            <ul className="projects-empty-hero__tips">
              <li>{t('projects.emptyHeroTip1')}</li>
              <li>{t('projects.emptyHeroTip2')}</li>
              <li>{t('projects.emptyHeroTip3')}</li>
            </ul>
            <Button
              type="primary"
              theme="solid"
              size="large"
              icon={<IconPlus />}
              className="projects-empty-hero__cta"
              onClick={handleOpenCreate}
            >
              {t('projects.emptyHeroCta')}
            </Button>
            <p className="projects-empty-hero__footnote">{t('projects.emptyHeroFootnote')}</p>
          </div>
        ) : (
          <>
            <div className="search-bar">
              <Input
                prefix={<IconSearch />}
                placeholder={t('projects.searchPlaceholder')}
                value={search}
                onChange={setSearch}
                onEnterPress={() => setPage(1)}
                showClear
              />
            </div>

            {showSearchEmpty ? (
              <div className="projects-search-empty">
                <p>{t('projects.searchNoMatch', { q: search })}</p>
                <Button type="tertiary" onClick={() => { setSearch(''); setPage(1); }}>
                  {t('projects.clearSearch')}
                </Button>
              </div>
            ) : (
              <Table
                dataSource={data?.data || []}
                loading={isLoading}
                pagination={{
                  currentPage: page,
                  pageSize: limit,
                  total: data?.total || 0,
                  onChange: setPage,
                }}
                rowKey="id"
              >
                <Column title={t('projects.colId')} dataIndex="id" />
                <Column title={t('projects.colName')} dataIndex="projectName" />
                <Column title={t('projects.colBusiness')} dataIndex="businessName" />
                <Column
                  title={t('projects.colOwner')}
                  dataIndex="owner"
                  render={(owner: string | undefined) => owner?.trim() || '-'}
                />
                <Column
                  title={t('projects.colCreatedAt')}
                  dataIndex="createdAt"
                  render={(time) => formatDateTime(time)}
                />
                <Column title={t('projects.colActions')} render={renderActions} />
              </Table>
            )}
          </>
        )}

        <Modal
          title={t('projects.createModalTitle')}
          visible={createVisible}
          onCancel={handleCloseCreate}
          footer={null}
          className="oh-form-modal"
        >
          <Form
            onSubmit={handleCreate}
            layout="vertical"
            getFormApi={setFormApi}
          >
            <Form.Input
              field="projectName"
              label={t('projects.fieldProjectName')}
              placeholder={t('projects.fieldProjectNamePh')}
              validate={(value) => {
                if (!value?.trim()) return t('projects.validation.projectNameRequired');
                return '';
              }}
              rules={[{ required: true, message: t('projects.validation.projectNameRequired') }]}
            />
            <Form.Select
              field="businessId"
              label={t('projects.fieldBusiness')}
              placeholder={
                businessLoading
                  ? t('projects.businessLoading')
                  : businessError
                    ? t('projects.businessError')
                    : t('projects.businessPlaceholder')
              }
              optionList={businessOptions}
              disabled={businessLoading || !!businessError}
              validate={(value) => {
                if (businessError) return t('projects.validation.businessLoadFailed');
                if (!value?.trim()) return t('projects.validation.businessRequired');
                return '';
              }}
              rules={[{ required: true, message: t('projects.validation.businessRequired') }]}
            />
            <Form.Input
              field="owner"
              label={t('projects.fieldOwnerEmail')}
              initValue={ownerEmail}
              disabled
              validate={(value) => {
                if (!value?.trim()) return t('projects.validation.ownerMissing');
                if (!isValidEmail(value.trim())) return t('projects.validation.ownerInvalid');
                return '';
              }}
            />
            <Form.TagInput
              field="collaborators"
              label={t('projects.fieldCollaborators')}
              placeholder={t('projects.collaboratorsPh')}
              separator={[',', '，', ';', '；']}
              addOnBlur
              allowDuplicates={false}
              validate={(value) => {
                const emails = normalizeCollaborators(value).filter((email) => email !== ownerEmail);
                const invalidEmail = emails.find((email) => !isValidEmail(email));
                if (invalidEmail) return t('projects.validation.collaboratorItemInvalid', { email: invalidEmail });
                return '';
              }}
            />
            <Form.TextArea
              field="description"
              label={t('projects.fieldDescription')}
              placeholder={t('projects.descriptionPh')}
              rows={3}
            />
            <div className="form-actions">
              <Button type="tertiary" onClick={handleCloseCreate}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" theme="solid" htmlType="submit" loading={creating}>
                {t('common.create')}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Projects;
