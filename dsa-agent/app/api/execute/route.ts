export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { NodeVM } from 'vm2';
import { PythonShell } from 'python-shell';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();
    if (!code || !language) {
      return NextResponse.json({ error: 'Missing code or language' }, { status: 400 });
    }

    if (language === 'javascript') {
      try {
        const vm = new NodeVM({
          console: 'redirect',
          sandbox: {},
          timeout: 3000,
        });
        let output = '';
        vm.on('console.log', (msg: string) => { output += msg + '\n'; });
        const result = vm.run(code);
        if (result !== undefined) output += String(result);
        return NextResponse.json({ output });
      } catch (err: any) {
        return NextResponse.json({ error: err.message });
      }
    } else if (language === 'python') {
      // Write code to a temp file and execute with python-shell
      const filename = `/tmp/${randomUUID()}.py`;
      try {
        await writeFile(filename, code, 'utf-8');
        let output = '';
        let error = '';
        try {
          const results = await PythonShell.run(filename, {});
          output = (results || []).join('\n');
        } catch (err: any) {
          error = err.message;
        }
        await unlink(filename);
        if (error) return NextResponse.json({ error });
        return NextResponse.json({ output });
      } catch (err: any) {
        try { await unlink(filename); } catch {}
        return NextResponse.json({ error: err.message });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 