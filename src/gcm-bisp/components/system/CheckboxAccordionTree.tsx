import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Checkbox } from "@mui/material";
import { ChevronDown } from "lucide-react";

// Estructura del nodo interno
interface AccountNode {
  id: string;
  label: string;
  children?: AccountNode[];
}

// Props públicas del componente
interface Props {
  data: any[];
  onSelectionChange: (selectedCuentaIDs: number[]) => void;
  title?: string;
  subTitle?: string;
}

// Ref expuesto al padre
export interface CheckboxAccordionTreeRef {
  clearSelection: () => void;
}

// Componente principal con forwardRef
const CheckboxAccordionTree = forwardRef<CheckboxAccordionTreeRef, Props>(
  ({ data, onSelectionChange, title, subTitle }, ref) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const idToCuentaID = new Map<string, string>();
    data.forEach((item) => {
      idToCuentaID.set(item.id, item.cuentaID);
    });

    const parseData = (flatData: any[]): AccountNode[] => {
      const groupedByCategory = new Map<string, any[]>();

      flatData.forEach((item) => {
        if (!groupedByCategory.has(item.categoria)) {
          groupedByCategory.set(item.categoria, []);
        }
        groupedByCategory.get(item.categoria)!.push(item);
      });

      const buildTree = (items: any[]): AccountNode[] => {
        const nodeMap = new Map<string, AccountNode>();
        const roots: AccountNode[] = [];

        items.forEach((item) => {
          nodeMap.set(item.cuentaID, {
            id: item.id,
            label: item.label,
            children: [],
          });
        });

        items.forEach((item) => {
          const node = nodeMap.get(item.cuentaID)!;
          if (item.parentId) {
            const parent = nodeMap.get(item.parentId);
            if (parent) {
              parent.children?.push(node);
            }
          } else {
            roots.push(node);
          }
        });

        return roots;
      };

      const result: AccountNode[] = [];

      groupedByCategory.forEach((items, category) => {
        result.push({
          id: `cat-${category}`,
          label: category,
          children: buildTree(items),
        });
      });

      return result;
    };

    const treeData = parseData(data);

    // Expone función clearSelection() al padre
    useImperativeHandle(ref, () => ({
      clearSelection: () => {
        setSelected(new Set());
        onSelectionChange([]);
      },
    }));

    useEffect(() => {
      const initialIds = new Set(
        data.filter((d) => d.selected === "1").map((d) => d.id)
      );

      const findFullySelectedNodes = (nodes: AccountNode[]): Set<string> => {
        const result = new Set<string>();

        const recurse = (node: AccountNode): boolean => {
          const hasChildren =
            Array.isArray(node.children) && node.children.length > 0;

          if (!hasChildren) {
            return initialIds.has(node.id);
          }

          const allChildrenSelected = (node.children ?? []).every(recurse);
          if (allChildrenSelected) {
            result.add(node.id);
            return true;
          }

          return false;
        };

        nodes.forEach(recurse);

        const merged = new Set<string>();
        initialIds.forEach((id) => merged.add(id));
        result.forEach((id) => merged.add(id));

        return merged;
      };

      const fullySelected = findFullySelectedNodes(treeData);
      setSelected(fullySelected);

      const selectedCuentas = Array.from(fullySelected)
        .map((id) => Number(idToCuentaID.get(id)))
        .filter((val): val is number => !isNaN(val));

      onSelectionChange(selectedCuentas);
    }, [data]);

    const handleToggle = (
      id: string,
      children: AccountNode[] = [],
      checked: boolean
    ) => {
      const newSelected = new Set(selected);

      const toggleRecursive = (node: AccountNode, isChecked: boolean) => {
        if (isChecked) {
          newSelected.add(node.id);
        } else {
          newSelected.delete(node.id);
        }
        node.children?.forEach((child) => toggleRecursive(child, isChecked));
      };

      toggleRecursive({ id, label: "", children }, checked);
      setSelected(newSelected);

      const selectedCuentas = Array.from(newSelected)
        .map((id) => Number(idToCuentaID.get(id)))
        .filter((val): val is number => !isNaN(val));

      onSelectionChange(selectedCuentas);
    };

    const handleExpandToggle = (id: string) => {
      const newExpanded = new Set(expanded);
      newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
      setExpanded(newExpanded);
    };

    const renderNode = (node: AccountNode, level: number = 0): React.ReactNode => {
      const isChecked = selected.has(node.id);
      const hasChildren =
        Array.isArray(node.children) && node.children.length > 0;
      const isExpanded = expanded.has(node.id);

      return (
        <div
          key={node.id}
          className="flex flex-col w-full divide-y divide-slate-200 dark:divide-slate-700"
        >
          <div
            className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${
              level > 0 ? "pl-4" : ""
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <Checkbox
                checked={isChecked}
                onChange={(e) =>
                  handleToggle(node.id, node.children || [], e.target.checked)
                }
                sx={{ padding: 0 }}
              />
              <span className="text-sm font-medium">{node.label}</span>
            </div>
            {hasChildren && (
              <button
                type="button"
                onClick={() => handleExpandToggle(node.id)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                aria-expanded={isExpanded}
              >
                <ChevronDown
                  className={`transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </button>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="ml-6">
              {(node.children || []).map((child) =>
                renderNode(child, level + 1)
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-[20px] border border-slate-200 dark:border-slate-700 relative p-8">
        <div>
          <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between pb-4">
            <h2 className="flex-shrink-0 text-normal font-bold text-primary-900 dark:text-white">
              {title}
            </h2>
          </header>
        </div>
        <div className="flex items-center h-12 px-4 bg-slate-100">
          <h2 className="text-left font-bold text-sm text-app-gray-700 dark:text-app-gray-100 uppercase">
            {subTitle}
          </h2>
        </div>
        {treeData.map((node) => renderNode(node))}
      </div>
    );
  }
);

export default CheckboxAccordionTree;