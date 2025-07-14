'use client'
import React, { useState } from 'react';
import Monaco from './Monaco';
import Selector from "@/components/shared/Selector";
import { useTerminalStore } from '@/store/terminalStore';


const lang = [
    { label: "Javascript", value: "javascript" },
    { label: "Python", value: "python" }
];

export default function Editor() {
    const [code, setCode] = useState<string>("// Write your code here\n");
    const [language, setLanguage] = useState<string>("javascript");
    const setTerminalOutput = useTerminalStore((state: { setOutput: (output: string) => void }) => state.setOutput);

    const handleExec = async () => {
        try {
            const res = await fetch('http://localhost:3001/exec/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();
            setTerminalOutput(data.output || data.error || 'No output');
        } catch (err) {
            setTerminalOutput('Execution failed');
        }
    };
console.log(language, code)
    return (
        <div className='h-full w-full '>

            <section className='h-10 w-full px-2 rounded-2xl'>
                <div className='h-full flex gap-2 px-2 justify-end items-center w-full bg-neutral-800/60 border border-neutral-700/30  mt-2 rounded-lg '>
                    <Selector
                        options={lang}
                        value={language}
                        onChange={setLanguage}
                        placeholder="Select language"
                        label="Language"
                        size='xs'
                    className='w-24 border-neutral-700 text-neutral-300' 
                    />
                    <div className='h-7 flex items-center border border-blue-300/40 justify-center w-24 text-sm bg-neutral-700/40 rounded-lg cursor-pointer select-none'
     onClick={handleExec}>
                        Exec
                    </div>
                </div>
            </section>
       
            <Monaco
                value={code}
                onChange={(val) => setCode(val ?? "")}
                language={language}
            />
           
        </div>

    );
}

