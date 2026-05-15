import re
with open('Notas/html.txt', 'r', encoding='utf-8') as f:
    data = f.read()
start = data.index('### `<h1>` `</h1>`')
txt = data[start:start+200]
print('ORIG:', repr(txt))
placeholders=[]
def repl_codeblock(m):
    placeholders.append(m.group(1))
    return f'@@PLACEHOLDER_{len(placeholders)-1}@@'
def repl_inline(m):
    placeholders.append(m.group(1))
    return f'@@PLACEHOLDER_{len(placeholders)-1}@@'
text1 = re.sub(r'(```[\s\S]*?```)', repl_codeblock, txt)
print('after codeblock:', repr(text1))
text2 = re.sub(r'(`[^`]+`)', repl_inline, text1)
print('after inline:', repr(text2))
print('placeholders:', placeholders)
text3 = text2.replace('<','&lt;').replace('>','&gt;')
print('after escape:', repr(text3))
for i,v in enumerate(placeholders):
    text3 = text3.replace(f'@@PLACEHOLDER_{i}@@', v)
    print(f'after restore {i}:', repr(text3))
print('final:', repr(text3))
