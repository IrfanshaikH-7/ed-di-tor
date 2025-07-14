'use client'
import React, { useState } from 'react';
import Monaco from './Monaco';
import Selector from "@/components/shared/Selector";


const lang = [
    { label: "Javascript", value: "javascript" },
    { label: "Python", value: "python" }
];

export default function Editor() {
    const [code, setCode] = useState<string>("// Write your code here\n");
    const [language, setLanguage] = useState<string>("javascript");
console.log(language, code)
    return (
        <div className='h-full w-full '>

            <section className='h-10 w-full px-2 rounded-2xl'>
                <div className='h-full flex px-2 justify-end items-center w-full bg-neutral-800/60 border border-neutral-700/30  mt-2 rounded-lg '>
                    <Selector
                        options={lang}
                        value={language}
                        onChange={setLanguage}
                        placeholder="Select language"
                        label="Language"
                        size='xs'
                    className='w-24 border-neutral-700 text-neutral-300' 
                    />
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

