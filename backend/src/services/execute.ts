import { NodeVM } from 'vm2';
import { PythonShell } from 'python-shell';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import os from 'os';

export const execute = async (req: Request, res: Response) => {
  const { code, language } = req.body;
  console.log('hehe')
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing code or language' });
  }

  if (language === 'javascript') {
    try {
      const vm = new NodeVM({
        console: 'redirect',
        sandbox: {},
        timeout: 3000,
      });
      let output = '';
      vm.on('console.log', (msg) => { output += msg + '\n'; });
      const result = vm.run(code);
      if (result !== undefined) {
        if (typeof result === 'object') {
          // Only append if not an empty object
          if (Object.keys(result).length > 0) {
            output += JSON.stringify(result, null, 2);
          }
        } else {
          output += String(result);
        }
      }
      return res.json({ output });
    } catch (err) {
      return res.json({ error: (err as Error).message });
    }
  } else if (language === 'python') {
    const filename = `${os.tmpdir()}/${randomUUID()}.py`;
    try {
      await writeFile(filename, code, 'utf-8');
      let output = '';
      let error = '';
      try {
        const results = await PythonShell.run(filename, {});
        output = (results || []).join('\n');
      } catch (err) {
        error = (err as Error).message;
      }
      await unlink(filename);
      if (error) return res.json({ error });
      return res.json({ output });
    } catch (err) {
      try { await unlink(filename); } catch {}
      return res.json({ error: (err as Error).message });
    }
  } else {
    return res.status(400).json({ error: 'Unsupported language' });
  }
};