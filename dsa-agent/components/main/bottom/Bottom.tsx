'use client'
import React, { useState } from 'react';
import { useTerminalStore } from '@/store/terminalStore';

export default function Bottom() {
  const [tab, setTab] = useState<'terminal' | 'cases'>('terminal');
  const output = useTerminalStore(state => state.output);
  const error = useTerminalStore(state => state.error);
console.log('output', output)
  // Helper to format lines with '- '
  function formatLines(text: string) {
    return text
      .split(/\r?\n/)
      .map(line => line ? `- ${line}` : '')
      .join('\n');
  }
  return (
    <div className='h-full w-[100%] p-1.5 relative'>
      <div className='flex gap-1 rounded-[12px] bg-neutral-700/50 py-1 px-2 absolute top-3 right-3'>
        <span onClick={() => setTab('terminal')} className={`text-[9px] tracking-wider cursor-pointer bg-neutral-800/50 rounded-md py-1 px-3 ${tab === 'terminal' ? 'font-bold ' : ''}`}>Terminal</span>
        <span onClick={() => setTab('cases')} className={`text-[9px] tracking-wider cursor-pointer bg-neutral-800/50 rounded-md py-1 px-3 ${tab === 'cases' ? 'font-bold ' : ''}`}>Cases</span>
      </div>
      {tab === 'terminal' ? (
        <div className='h-full w-full text-sm bg-neutral-900/80 rounded-xl p-2  overflow-y-scroll no-scrollbar'>
          {error ? (
            <>
              <pre style={{ margin: 0, background: 'transparent', color: 'red', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{formatLines(error)}</pre>
            </>
          ) : (
            <>
              <pre style={{ margin: 0, background: 'transparent', color: 'inherit', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{formatLines(output) ? formatLines(output) : <span className='animate-pulse'>...</span> }</pre>
            </>
          )}
        </div>
      ) : (
        <div className='h-full w-full bg-neutral-900/80 rounded-xl p-2'>
          
        </div>
      )}
    </div>
  );
}
