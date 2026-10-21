import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, icon, action, children }: PageHeaderProps) {
  const hasAction: boolean = action !== undefined;
  const hasChildren: boolean = children !== undefined;
  const hasIcon: boolean = icon !== undefined;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          {hasIcon ? icon : null}
          <h1 className="truncate text-lg font-bold tracking-tight text-foreground">{title}</h1>
        </div>
        {hasAction ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
      </header>
      {hasChildren ? (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
      ) : null}
    </>
  );
}
