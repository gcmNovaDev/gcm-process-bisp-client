'use client';

import Icon from "@/gcm-bisp/components/ui/Icon";
import { FolderNode } from "../api/types/dashboard.types";

interface FeatureStructureTreeProps {
  root: FolderNode;
}

function TreeNode({ node, depth }: { node: FolderNode; depth: number }) {
  return (
    <li>
      <div className="flex items-start gap-2 py-1" style={{ paddingLeft: depth * 18 }}>
        <Icon
          name={node.isFile ? "FileCode2" : "Folder"}
          size={16}
          className={`mt-0.5 shrink-0 ${node.isFile ? "text-slate-400" : "text-primary-500"}`}
        />
        <div className="min-w-0">
          <span className={`text-sm ${node.isFile ? "text-slate-700" : "font-semibold text-slate-800"} break-all`}>
            {node.name}
          </span>
          {node.description && <p className="text-xs text-slate-400">{node.description}</p>}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={`${depth}-${child.name}`} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FeatureStructureTree({ root }: FeatureStructureTreeProps) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-5 font-poppins">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="FolderTree" size={18} className="text-primary-600" />
        <h2 className="text-sm font-semibold text-slate-800">Estructura de un feature</h2>
      </div>
      <ul className="font-mono">
        <TreeNode node={root} depth={0} />
      </ul>
    </div>
  );
}
