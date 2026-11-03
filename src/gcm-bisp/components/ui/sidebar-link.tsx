import Link from "next/link";
import Icon from "./Icon";
import { usePathname } from "next/navigation";

interface Props {
  name: string;
  path: string;
  icon?: string;
}

export function SidebarLink({ name, path, icon }: Props) {

  const pathname = usePathname();

  const isProtocol = path.includes("://");
  const isActive = pathname === path;

  if (isProtocol) {
    return (
      <a
        href={path}
        className={`flex items-center gap-3 px-4 py-2 text-sm transition rounded-xl
          ${isActive ? "bg-primary-700 text-white" : "text-primary-200 hover:bg-primary-900 hover:text-white"}`}
      >
        {icon && <Icon name={icon as any} size={16} className={isActive ? "text-white" : "text-primary-300"} />}
        {name}
      </a>
    );
  }

  return (
    <Link
      href={path}
      className={`flex items-center gap-3 px-4 py-2 text-sm transition rounded-xl
        ${isActive ? "bg-primary-700 text-white" : "text-primary-200 hover:bg-primary-900 hover:text-white"}`}
    >
      {icon && <Icon name={icon as any} size={16} className={isActive ? "text-white" : "text-primary-300"} />}
      {name}
    </Link>
  );
}