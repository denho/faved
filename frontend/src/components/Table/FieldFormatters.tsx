import * as React from 'react';
import { flexRender } from '@tanstack/react-table';

export const TitleFormatter = ({ output }) => {
  return (
    <h4 className="line-clamp-3 scroll-m-20 font-semibold tracking-tight wrap-anywhere @xl/item:text-lg @3xl/item:text-xl">
      {output}
    </h4>
  );
};

export const URLFormatter = ({ output }) => {
  return <div className="line-clamp-3 text-sm break-all @xl/item:text-base">{output}</div>;
};

export const DescriptionFormatter = ({ output }) => {
  return (
    <div className="text-muted-foreground line-clamp-3 text-sm leading-6 wrap-anywhere whitespace-pre-line @3xl/item:line-clamp-none">
      {output}
    </div>
  );
};

export const NotesFormatter = ({ output }) => {
  return (
    <blockquote className="text-muted-foreground line-clamp-3 border-l-2 pl-6 text-sm wrap-anywhere whitespace-pre-line italic @3xl/item:line-clamp-none">
      {output}
    </blockquote>
  );
};

export const DateFormatter = ({ output, cell }) => {
  return (
    <div className="text-muted-foreground text-xs @xl/item:text-sm">
      <span className="leading-none font-medium">{cell.column.columnDef.header}:</span> {output}
    </div>
  );
};

export const renderField = ({ cell }) => {
  const isActionColumn = cell.column.columnDef.meta?.isAction ?? false;
  const value = cell.getValue();

  if (!isActionColumn && (value === undefined || value === null || value === '')) {
    return null;
  }
  const output = flexRender(cell.column.columnDef.cell, cell.getContext());

  const componentMap = {
    comments: <NotesFormatter output={output} />,
    description: <DescriptionFormatter output={output} />,
    url: <URLFormatter output={output} />,
    title: <TitleFormatter output={output} />,
    created_at: <DateFormatter output={output} cell={cell} />,
    updated_at: <DateFormatter output={output} cell={cell} />,
    default: output,
  };
  return (
    <div className={`${cell.column.id}-container`} key={cell.id}>
      {componentMap[cell.column.id] || componentMap.default}
    </div>
  );
};
