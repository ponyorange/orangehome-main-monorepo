import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Tag, Popconfirm, Modal, Form, Toast } from '@douyinfe/semi-ui';
import { IconPlus, IconSearch, IconEdit, IconDelete } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import MainLayout from '../../components/Layout';
import { getProjects, deleteProject, createProject, Project } from '../../api/projects';
import './index.scss';

const { Column } = Table;

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    ['projects', page, limit, search],
    () => getProjects({ page, limit, search }),
    { keepPreviousData: true }
  );

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
    description?: string;
  }) => {
    setCreating(true);
    try {
      await createProject({
        ...values,
        businessId: 'default', // 默认业务线，后续可从业务线列表选择
      });
      Toast.success('创建成功');
      setCreateVisible(false);
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
          <Button icon={<IconPlus />} type="primary" onClick={() => setCreateVisible(true)}>
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
            render={(time) => new Date(time).toLocaleString()}
          />
          <Column title="操作" render={renderActions} />
        </Table>

        {/* 创建项目弹窗 */}
        <Modal
          title="新建项目"
          visible={createVisible}
          onCancel={() => setCreateVisible(false)}
          footer={null}
        >
          <Form onSubmit={handleCreate}>
            <Form.Input
              field="projectCode"
              label="项目编码"
              placeholder="请输入项目编码"
              rules={[{ required: true, message: '请输入项目编码' }]}
            />
            <Form.Input
              field="projectName"
              label="项目名称"
              placeholder="请输入项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            />
            <Form.TextArea
              field="description"
              label="项目描述"
              placeholder="请输入项目描述（可选）"
              rows={3}
            />
            <div className="form-actions">
              <Button type="tertiary" onClick={() => setCreateVisible(false)}>
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
