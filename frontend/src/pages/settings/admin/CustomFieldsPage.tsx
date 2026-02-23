import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { customFieldsApi } from '@/lib/api/custom-fields';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CustomFieldDef } from '@/types/api';

type TargetType = 'demand' | 'supply' | 'project' | 'worker';

const targetTabs: { value: TargetType; label: string }[] = [
  { value: 'demand', label: '需要' },
  { value: 'supply', label: '供給' },
  { value: 'project', label: '案件' },
  { value: 'worker', label: '作業員' },
];

const inputTypeOptions = [
  { value: 'text', label: 'テキスト' },
  { value: 'number', label: '数値' },
  { value: 'date', label: '日付' },
  { value: 'select', label: 'セレクト' },
  { value: 'checkbox', label: 'チェックボックス' },
  { value: 'textarea', label: 'テキストエリア' },
];

const emptyForm = {
  fieldLabel: '',
  fieldKey: '',
  inputType: 'text',
  options: '',
  isRequired: false,
};

export function CustomFieldsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TargetType>('demand');
  const [defs, setDefs] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const companyId = user?.companyId;

  const loadDefs = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const data = await customFieldsApi.getDefs(companyId, activeTab);
      setDefs(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      setDefs([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, activeTab]);

  useEffect(() => {
    loadDefs();
  }, [loadDefs]);

  const handleTabChange = (tab: TargetType) => {
    setActiveTab(tab);
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...defs];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const items = updated.map((d, i) => ({ id: d.id, sortOrder: i }));
    setDefs(updated);
    try {
      await customFieldsApi.updateSortOrder(items);
    } catch {
      await loadDefs();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= defs.length - 1) return;
    const updated = [...defs];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const items = updated.map((d, i) => ({ id: d.id, sortOrder: i }));
    setDefs(updated);
    try {
      await customFieldsApi.updateSortOrder(items);
    } catch {
      await loadDefs();
    }
  };

  const handleAdd = async () => {
    if (!companyId || !form.fieldLabel || !form.fieldKey || !form.inputType) return;
    setIsSaving(true);
    try {
      const dto: any = {
        companyId,
        targetType: activeTab,
        fieldLabel: form.fieldLabel,
        fieldKey: form.fieldKey,
        inputType: form.inputType,
        isRequired: form.isRequired,
        sortOrder: defs.length,
      };
      if (form.inputType === 'select' && form.options.trim()) {
        dto.options = form.options
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => ({ value: s, label: s }));
      }
      await customFieldsApi.createDef(companyId, dto);
      setForm({ ...emptyForm });
      setShowForm(false);
      await loadDefs();
    } catch {
      alert('追加に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('このカスタム項目を削除しますか？')) return;
    try {
      await customFieldsApi.removeDef(id);
      await loadDefs();
    } catch {
      alert('削除に失敗しました');
    }
  };

  if (!isAdminOrOwner) {
    return (
      <>
        <AppHeader title="カスタム項目管理" showBack />
        <PageContainer>
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-500">管理者のみ</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <AppHeader title="カスタム項目管理" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {targetTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${
                    activeTab === tab.value
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {defs.length === 0 && !showForm && (
                <EmptyState message="カスタム項目はまだありません" />
              )}

              {defs.map((def, index) => (
                <Card key={def.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {def.fieldLabel}
                      </p>
                      <p className="text-xs text-gray-500">
                        キー: {def.fieldKey} / タイプ: {def.inputType}
                        {def.isRequired && (
                          <span className="ml-1 text-red-500 font-medium">*必須</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                        aria-label="上に移動"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index >= defs.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                        aria-label="下に移動"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(def.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {showForm && (
                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">カスタム項目を追加</h3>

                  <Input
                    label="項目ラベル"
                    value={form.fieldLabel}
                    onChange={(e) => setForm((p) => ({ ...p, fieldLabel: e.target.value }))}
                    placeholder="例: 作業種別補足"
                    required
                  />

                  <Input
                    label="フィールドキー"
                    value={form.fieldKey}
                    onChange={(e) => setForm((p) => ({ ...p, fieldKey: e.target.value }))}
                    placeholder="例: work_type_note"
                    required
                  />

                  <Select
                    label="入力タイプ"
                    options={inputTypeOptions}
                    value={form.inputType}
                    onChange={(e) => setForm((p) => ({ ...p, inputType: e.target.value }))}
                    required
                  />

                  {form.inputType === 'select' && (
                    <Input
                      label="選択肢（カンマ区切り）"
                      value={form.options}
                      onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))}
                      placeholder="例: 選択肢1, 選択肢2, 選択肢3"
                    />
                  )}

                  <Toggle
                    label="必須項目にする"
                    checked={form.isRequired}
                    onChange={(checked) => setForm((p) => ({ ...p, isRequired: checked }))}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowForm(false);
                        setForm({ ...emptyForm });
                      }}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={handleAdd}
                      disabled={isSaving || !form.fieldLabel || !form.fieldKey}
                      className="flex-1"
                    >
                      {isSaving ? '追加中...' : '追加'}
                    </Button>
                  </div>
                </Card>
              )}

              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  追加
                </Button>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </>
  );
}
