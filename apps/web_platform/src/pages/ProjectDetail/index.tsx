import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Table, Button, Input, Popconfirm, Modal, Form, Toast, Typography } from '@douyinfe/semi-ui';
import { IconPlus, IconSearch, IconEdit, IconDelete, IconArrowLeft } from '@douyinfe/semi-icons';
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
      Toast.success('删除成功');
      mutatePages();
    } catch (err: any) {
      Toast.error(err.message || '删除失败');
    }
  };

  const handleCreatePage = async (values: { path: string; title: string; description?: string }) => {
    if (!id) return;
    setCreatingPage(true);
    try {
      await createPage({
        ...values,
        projectId: id,
      });
      Toast.success('创建成功');
      setCreatePageVisible(false);
      mutatePages();
    } catch (err: any) {
      Toast.error(err.message || '创建失败');
    } finally {
      setCreatingPage(false);
    }
  };

  const handleEditPage = (pageId: string) => {
    window.open(`http://localhost:5173/?pageId=${encodeURIComponent(pageId)}`, '_blank', 'noopener,noreferrer');
  };

  const renderPageActions = (record: Page) => (
    <div className="action-buttons">
      <Button
        icon={<IconEdit />}
        theme="borderless"
        onClick={() => handleEditPage(record.id)}
      >
        编辑
      </Button>
      <Popconfirm
        title="确认删除"
        content={`确定要删除页面 "${record.title}" 吗？`}
        onConfirm={() => handleDeletePage(record.id)}
      >
        <Button icon={<IconDelete />} theme="borderless" type="danger">
          删除
        </Button>
      </Popconfirm>
    </div>
  );

  return (
    <MainLayout>
      <div className="project-detail-page">
        <div className="page-header">
          <Button icon={<IconArrowLeft />} theme="borderless" onClick={() => navigate('/projects')}>
            返回
          </Button>
          <div className="header-info">
            <Title heading={4}>{project?.projectName || '加载中...'}</Title>
            <Text type="tertiary">编码: {project?.projectCode}</Text>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="页面管理" itemKey="pages">
            <Card>
              <div className="pages-toolbar">
                <Input
                  prefix={<IconSearch />}
                  placeholder="搜索页面"
                  value={pageSearch}
                  onChange={setPageSearch}
                  onEnterPress={() => setPagePage(1)}
                  showClear
                  style={{ width: 300 }}
                />
                <Button icon={<IconPlus />} type="primary" onClick={() => setCreatePageVisible(true)}>
                  新建页面
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
                <Column title="页面路径" dataIndex="path" />
                <Column title="页面标题" dataIndex="title" />
                <Column
                  title="描述"
                  dataIndex="description"
                  render={(desc) => desc || '-'}
                />
                <Column
                  title="发布状态"
                  dataIndex="publishedVersionId"
                  render={(published) => (published ? '已发布' : '未发布')}
                />
                <Column
                  title="创建时间"
                  dataIndex="createdAt"
                  render={(time) => formatDateTime(time)}
                />
                <Column title="操作" render={renderPageActions} />
              </Table>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane tab="项目设置" itemKey="settings">
            <Card title="基本信息">
              <div className="info-item">
                <Text type="secondary">项目编码:</Text>
                <Text>{project?.projectCode}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">项目名称:</Text>
                <Text>{project?.projectName}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">业务线:</Text>
                <Text>{project?.businessName}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">描述:</Text>
                <Text>{project?.description || '-'}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">创建时间:</Text>
                <Text>{formatDateTime(project?.createdAt)}</Text>
              </div>
            </Card>
          </Tabs.TabPane>
        </Tabs>

        {/* 创建页面弹窗 */}
        <Modal
          title="新建页面"
          visible={createPageVisible}
          onCancel={() => setCreatePageVisible(false)}
          footer={null}
        >
          <Form onSubmit={handleCreatePage}>
            <Form.Input
              field="path"
              label="页面路径"
              placeholder="如: /home"
              rules={[{ required: true, message: '请输入页面路径' }]}
            />
            <Form.Input
              field="title"
              label="页面标题"
              placeholder="请输入页面标题"
              rules={[{ required: true, message: '请输入页面标题' }]}
            />
            <Form.TextArea
              field="description"
              label="页面描述"
              placeholder="请输入页面描述（可选）"
              rows={3}
            />
            <div className="form-actions">
              <Button type="tertiary" onClick={() => setCreatePageVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={creatingPage}>
                创建
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
