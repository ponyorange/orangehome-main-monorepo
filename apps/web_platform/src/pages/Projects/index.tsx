import React, { useMemo, useState } from 'react';
import { Table, Button, Input, Popconfirm, Modal, Form, Toast } from '@douyinfe/semi-ui';
import { IconPlus, IconSearch, IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import MainLayout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { getProjects, deleteProject, createProject, Project } from '../../api/projects';
import { getBusinesses } from '../../api/businesses';
import { isValidEmail } from '../../utils/validators';
import './index.scss';

const { Column } = Table;
const normalizeCollaborators = (value?: string[]) =>
  Array.from(new Set((value || []).map((item) => item.trim()).filter(Boolean)));
const formatDateTime = (value?: string | number | Date) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const Projects: React.FC = () => {
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
      projectCode: '',
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
      Toast.success('删除成功');
      mutate();
    } catch (err: any) {
      Toast.error(err.message || '删除失败');
    }
  };

  const handleCreate = async (values: {
    projectCode: string;
    projectName: string;
    businessId: string;
    owner?: string;
    collaborators?: string[];
    description?: string;
  }) => {
    const collaborators = normalizeCollaborators(values.collaborators).filter((email) => email !== ownerEmail);

    if (!ownerEmail) {
      Toast.error('未获取到当前登录用户邮箱，无法创建项目');
      return;
    }

    if (!isValidEmail(ownerEmail)) {
      Toast.error('当前登录用户邮箱格式不正确');
      return;
    }

    const invalidCollaborator = collaborators.find((email) => !isValidEmail(email));
    if (invalidCollaborator) {
      Toast.error(`协作者邮箱格式不正确：${invalidCollaborator}`);
      return;
    }

    setCreating(true);
    try {
      await createProject({
        projectCode: values.projectCode.trim(),
        projectName: values.projectName.trim(),
        businessId: values.businessId.trim(),
        owner: ownerEmail,
        collaborators,
        description: values.description?.trim() || undefined,
      });
      Toast.success('创建成功');
      handleCloseCreate();
      mutate();
    } catch (err: any) {
      Toast.error(err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const renderActions = (record: Project) => (
    <div className="action-buttons">
      <Button
        icon={<IconEdit />}
        theme="borderless"
        onClick={() => navigate(`/projects/${record.id}`)}
      >
        详情
      </Button>
      <Popconfirm
        title="确认删除"
        content={`确定要删除项目 "${record.projectName}" 吗？`}
        onConfirm={() => handleDelete(record.id)}
      >
        <Button icon={<IconDelete />} theme="borderless" type="danger">
          删除
        </Button>
      </Popconfirm>
    </div>
  );

  return (
    <MainLayout>
      <div className="projects-page">
        <div className="page-header">
          <h1>项目管理</h1>
          <Button icon={<IconPlus />} type="primary" onClick={handleOpenCreate}>
            新建项目
          </Button>
        </div>

        <div className="search-bar">
          <Input
            prefix={<IconSearch />}
            placeholder="搜索项目名称或编码"
            value={search}
            onChange={setSearch}
            onEnterPress={() => setPage(1)}
            showClear
          />
        </div>

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
          <Column title="项目编码" dataIndex="projectCode" />
          <Column title="项目名称" dataIndex="projectName" />
          <Column title="业务线" dataIndex="businessName" />
          <Column
            title="描述"
            dataIndex="description"
            render={(desc) => desc || '-'}
          />
          <Column
            title="创建时间"
            dataIndex="createdAt"
            render={(time) => formatDateTime(time)}
          />
          <Column title="操作" render={renderActions} />
        </Table>

        {/* 创建项目弹窗 */}
        <Modal
          title="新建项目"
          visible={createVisible}
          onCancel={handleCloseCreate}
          footer={null}
          className="create-project-modal"
        >
          <Form
            onSubmit={handleCreate}
            layout="vertical"
            getFormApi={setFormApi}
            className="create-project-form"
          >
            <Form.Input
              field="projectCode"
              label="项目编码"
              placeholder="请输入项目编码，例如：my-project"
              validate={(value) => {
                if (!value?.trim()) return '请输入项目编码';
                return '';
              }}
              rules={[{ required: true, message: '请输入项目编码' }]}
            />
            <Form.Input
              field="projectName"
              label="项目名称"
              placeholder="请输入项目名称"
              validate={(value) => {
                if (!value?.trim()) return '请输入项目名称';
                return '';
              }}
              rules={[{ required: true, message: '请输入项目名称' }]}
            />
            <Form.Select
              field="businessId"
              label="所属业务线"
              placeholder={
                businessLoading
                  ? '业务线加载中...'
                  : businessError
                    ? '业务线加载失败，请稍后重试'
                    : '请选择业务线'
              }
              optionList={businessOptions}
              disabled={businessLoading || !!businessError}
              validate={(value) => {
                if (businessError) return '业务线加载失败，请稍后重试';
                if (!value?.trim()) return '请选择业务线';
                return '';
              }}
              rules={[{ required: true, message: '请选择业务线' }]}
            />
            <Form.Input
              field="owner"
              label="负责人邮箱"
              initValue={ownerEmail}
              disabled
              validate={(value) => {
                if (!value?.trim()) return '未获取到当前登录用户邮箱';
                if (!isValidEmail(value.trim())) return '负责人邮箱格式不正确';
                return '';
              }}
            />
            <Form.TagInput
              field="collaborators"
              label="协作者邮箱"
              placeholder="输入邮箱后回车添加"
              separator={[',', '，', ';', '；']}
              addOnBlur
              allowDuplicates={false}
              validate={(value) => {
                const emails = normalizeCollaborators(value).filter((email) => email !== ownerEmail);
                const invalidEmail = emails.find((email) => !isValidEmail(email));
                if (invalidEmail) return `协作者邮箱格式不正确：${invalidEmail}`;
                return '';
              }}
            />
            <Form.TextArea
              field="description"
              label="项目描述"
              placeholder="请输入项目描述（可选）"
              rows={3}
            />
            <div className="form-actions">
              <Button type="tertiary" onClick={handleCloseCreate}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                创建
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Projects;
