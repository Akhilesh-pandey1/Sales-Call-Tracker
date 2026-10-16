import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, action, children }: PageHeaderProps) {
  const hasAction: boolean = action !== undefined;
  const hasChildren: boolean = children !== undefined;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6 lg:px-8">
        <h1 className="truncate text-lg font-bold tracking-tight text-foreground">{title}</h1>
        {hasAction ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
      </header>
      {hasChildren ? (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
      ) : null}
    </>
  );
}
