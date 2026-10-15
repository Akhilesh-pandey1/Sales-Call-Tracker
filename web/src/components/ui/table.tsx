import * as React from "react";
import { cn } from "@/shared/utils/cn";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const tableClassName: string = cn("w-full caption-bottom text-sm", className);
  return (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={tableClassName} {...props} />
    </div>
  );
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const headerClassName: string = cn("[&_tr]:border-b", className);
  return <thead ref={ref} className={headerClassName} {...props} />;
});
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const bodyClassName: string = cn("[&_tr:last-child]:border-0", className);
  return <tbody ref={ref} className={bodyClassName} {...props} />;
});
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const footerClassName: string = cn(
    "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
    className
  );
  return <tfoot ref={ref} className={footerClassName} {...props} />;
});
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  const rowClassName: string = cn(
    "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
    className
  );
  return <tr ref={ref} className={rowClassName} {...props} />;
});
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const headClassName: string = cn(
    "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
    className
  );
  return <th ref={ref} className={headClassName} {...props} />;
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const cellClassName: string = cn(
    "p-4 align-middle [&:has([role=checkbox])]:pr-0",
    className
  );
  return <td ref={ref} className={cellClassName} {...props} />;
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  const captionClassName: string = cn("mt-4 text-sm text-muted-foreground", className);
  return <caption ref={ref} className={captionClassName} {...props} />;
});
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
