import re
with open('Notas/html.txt', 'r', encoding='utf-8') as f:
    data = f.read()
start = data.index('### `<h1>` `</h1>`')
txt = data[start:start+200]
print(txt)
print('--- processed ---')
placeholders=[]
def repl_codeblock(m):
    placeholders.append(m.group(1))
    return f'@@PLACEHOLDER_{len(placeholders)-1}@@'
def repl_inline(m):
    placeholders.append(m.group(1))
    return f'@@PLACEHOLDER_{len(placeholders)-1}@@'

txt2 = re.sub(r'(```[\s\S]*?```)', repl_codeblock, txt)
txt2 = re.sub(r'(`[^`]+`)', repl_inline, txt2)
txt2 = txt2.replace('<','&lt;').replace('>','&gt;')
for i, v in enumerate(placeholders):
    txt2 = txt2.replace(f'@@PLACEHOLDER_{i}@@', v)
print(txt2)
