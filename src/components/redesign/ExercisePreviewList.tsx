import { useState } from 'react';
import { Link } from 'react-router-dom';

type Item = { id: string; name: string; setsText: string };

export function ExercisePreviewList({
  items,
  href,
}: {
  items: Item[];
  href: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 5);
  const hasMore = items.length > 5;
  return (
    <div className='rounded-2xl bg-bg-2 p-4 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-semibold uppercase tracking-widest text-txt-faint'>
          Exercícios de hoje
        </p>
        <Link to={href} className='text-[10px] font-semibold text-lime'>
          abrir →
        </Link>
      </div>
      <ul className='flex flex-col gap-2'>
        {visible.map((it) => (
          <li
            key={it.id}
            data-testid='preview-row'
            className='flex items-center justify-between gap-3 text-sm'
          >
            <span className='min-w-0 flex-1 truncate'>{it.name}</span>
            <span className='shrink-0 text-xs text-txt-faint'>{it.setsText}</span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className='self-start text-[11px] font-semibold uppercase tracking-widest text-txt-faint active:text-lime'
        >
          {expanded ? 'Mostrar menos' : `Ver todos (${items.length})`}
        </button>
      )}
    </div>
  );
}
