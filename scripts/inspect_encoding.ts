
import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, '../public/Class_27.txt');
const buffer = fs.readFileSync(file);
console.log('First 20 bytes:', buffer.subarray(0, 20).toString('hex'));
console.log('utf-8:', buffer.subarray(0, 20).toString('utf-8'));
console.log('utf16le:', buffer.subarray(0, 20).toString('utf16le'));
