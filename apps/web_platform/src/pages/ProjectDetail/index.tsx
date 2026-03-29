import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Table, Button, Input, Popconfirm, Modal, Form, Toast, Typography } from '@douyinfe/semi-ui';
import { IconPlus, IconSearch, IconEdit, IconDelete, IconArrowLeft } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import MainLayout from '../../components/Layout';
import { getProject } from '../../api/projects';
import { getPages, createPage, deletePage, Page } from '../../api/pages';
import './index.scss';

const { Title, Text } = Typography;
const { Column } = Table;
const formatDateTime = (value?: string | number | Date) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const ProjectDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pages');
  const [pageSearch, setPageSearch] = useState('');
  const [pagePage, setPagePage] = useState(1);
  const [pageLimit] = useState(10);
  const [createPageVisible, setCreatePageVisible] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);

  const { data: project, isLoading: projectLoading } = useSWR(
    id ? ['project', id] : null,
    () => getProject(id!)
  );

  const { data: pagesData, mutate: mutatePages } = useSWR(
    id ? ['pages', id, pagePage, pageLimit, pageSearch] : null,
    () => getPages({ projectId: id!, page: pagePage, limit: pageLimit, search: pageSearch }),
    { keepPreviousData: true }
  );

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      Toast.success(t('projectDetail.deleteSuccess'));
      mutatePages();
    } catch (err: any) {
      Toast.error(err.message || t('projectDetail.deleteFailed'));
    }
  };

  const handleCreatePage = async (values: { title: string; description?: string }) => {
    if (!id) return;
    setCreatingPage(true);
    try {
      await createPage({
        projectId: id,
        path: 'orangehome',
        title: values.title,
        description: values.description,
      });
      Toast.success(t('projectDetail.createPageSuccess'));
      setCreatePageVisible(false);
      mutatePages();
    } catch (err: any) {
      Toast.error(err.message || t('projectDetail.createPageFailed'));
    } finally {
      setCreatingPage(false);
    }
  };

  const handleEditPage = (pageId: string) => {
    const q = `pageId=${encodeURIComponent(pageId)}`;
    const custom = import.meta.env.VITE_BUILDER_URL?.replace(/\/$/, '');
    const href = custom
      ? `${custom}/?${q}`
      : new URL(`/builder/?${q}`, window.location.origin).href;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const renderPageActions = (record: Page) => (
    <div className="action-buttons">
      <Button
        icon={<IconEdit />}
        theme="borderless"
        onClick={() => handleEditPage(record.id)}
      >
        {t('projectDetail.edit')}
      </Button>
      <Popconfirm
        title={t('projectDetail.confirmDeletePage')}
        content={t('projectDetail.confirmDeletePageContent', { title: record.title })}
        onConfirm={() => handleDeletePage(record.id)}
      >
        <Button icon={<IconDelete />} theme="borderless" type="danger">
          {t('common.delete')}
        </Button>
      </Popconfirm>
    </div>
  );

  const projectTitle = projectLoading && !project?.projectName
    ? t('projectDetail.loadingName')
    : project?.projectName || t('projectDetail.loadingName');

  return (
    <MainLayout>
      <div className="project-detail-page">
        <div className="page-header">
          <Button icon={<IconArrowLeft />} theme="borderless" onClick={() => navigate('/projects')}>
            {t('projectDetail.back')}
          </Button>
          <div className="header-info">
            <Title heading={4}>{projectTitle}</Title>
            <Text type="tertiary">
              {t('projectDetail.codeLabel')}: {project?.projectCode ?? '—'}
            </Text>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab={t('projectDetail.tabPages')} itemKey="pages">
            <Card>
              <div className="pages-toolbar">
                <Input
                  prefix={<IconSearch />}
                  placeholder={t('projectDetail.searchPagesPh')}
                  value={pageSearch}
                  onChange={setPageSearch}
                  onEnterPress={() => setPagePage(1)}
                  showClear
                  style={{ width: 300 }}
                />
                <Button icon={<IconPlus />} type="primary" theme="solid" onClick={() => setCreatePageVisible(true)}>
                  {t('projectDetail.newPage')}
                </Button>
              </div>

              <Table
                dataSource={pagesData?.data || []}
                loading={!pagesData}
                pagination={{
                  currentPage: pagePage,
                  pageSize: pageLimit,
                  total: pagesData?.total || 0,
                  onChange: setPagePage,
                }}
                rowKey="id"
              >
                <Column title={t('projectDetail.colPageId')} dataIndex="id" />
                <Column title={t('projectDetail.colTitle')} dataIndex="title" />
                <Column
                  title={t('projectDetail.colDescription')}
                  dataIndex="description"
                  render={(desc) => desc || '-'}
                />
                <Column
                  title={t('projectDetail.colPublish')}
                  dataIndex="publishedVersionId"
                  render={(published) => (published ? t('projectDetail.published') : t('projectDetail.unpublished'))}
                />
                <Column
                  title={t('projectDetail.colCreatedAt')}
                  dataIndex="createdAt"
                  render={(time) => formatDateTime(time)}
                />
                <Column title={t('projectDetail.colActions')} render={renderPageActions} />
              </Table>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane tab={t('projectDetail.tabSettings')} itemKey="settings">
            <Card title={t('projectDetail.cardBasicInfo')}>
              <div className="info-item">
                <Text type="secondary">{t('projectDetail.labelProjectCode')}:</Text>
                <Text>{project?.projectCode}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">{t('projectDetail.labelProjectName')}:</Text>
                <Text>{project?.projectName}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">{t('projectDetail.labelBusiness')}:</Text>
                <Text>{project?.businessName}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">{t('projectDetail.labelDescription')}:</Text>
                <Text>{project?.description || '-'}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">{t('projectDetail.labelCreatedAt')}:</Text>
                <Text>{formatDateTime(project?.createdAt)}</Text>
              </div>
            </Card>
          </Tabs.TabPane>
        </Tabs>

        <Modal
          title={t('projectDetail.createPageModalTitle')}
          visible={createPageVisible}
          onCancel={() => setCreatePageVisible(false)}
          footer={null}
          className="oh-form-modal"
        >
          <Form onSubmit={handleCreatePage} layout="vertical">
            <Form.Input
              field="title"
              label={t('projectDetail.fieldPageTitle')}
              placeholder={t('projectDetail.fieldPageTitlePh')}
              rules={[{ required: true, message: t('projectDetail.validation.titleRequired') }]}
            />
            <Form.TextArea
              field="description"
              label={t('projectDetail.fieldPageDesc')}
              placeholder={t('projectDetail.fieldPageDescPh')}
              rows={3}
            />
            <div className="form-actions">
              <Button type="tertiary" onClick={() => setCreatePageVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" theme="solid" htmlType="submit" loading={creatingPage}>
                {t('common.create')}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
