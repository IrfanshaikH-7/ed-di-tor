'use client'
import React, { useState } from 'react';
import { useTerminalStore } from '@/store/terminalStore';

export default function Bottom() {
  const [tab, setTab] = useState<'terminal' | 'cases'>('terminal');
  const output = useTerminalStore(state => state.output);
console.log('output', output)
  return (
    <div className='h-full w-[100%] p-1.5 relative'>
      <div className='flex gap-1 rounded-[12px] bg-neutral-700/50 py-1 px-2 absolute top-3 right-3'>
        <span onClick={() => setTab('terminal')} className={`text-[9px] tracking-wider cursor-pointer bg-neutral-800/50 rounded-md py-1 px-3 ${tab === 'terminal' ? 'font-bold ' : ''}`}>Terminal</span>
        <span onClick={() => setTab('cases')} className={`text-[9px] tracking-wider cursor-pointer bg-neutral-800/50 rounded-md py-1 px-3 ${tab === 'cases' ? 'font-bold ' : ''}`}>Cases</span>
      </div>
      {tab === 'terminal' ? (
        <div className='h-full w-full text-sm bg-neutral-900/80 rounded-xl p-2'>
          <pre style={{ margin: 0, background: 'transparent', color: 'inherit', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{output || 'terminal say somthing'}</pre>
        </div>
      ) : (
        <div className='h-full w-full bg-neutral-900/80 rounded-xl p-2'>
          cases
        </div>
      )}
    </div>
  );
}
