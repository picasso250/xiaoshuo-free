import os

ext = ".html"
for i in range(1, 99999):
    p = str(i)+ext
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f.readlines():
                title = line.strip()
                tpl = "<li> <a href=\"#{}\" data-index=\"0\">{}</a> </li>"
                li = tpl.format(i, title)
                print(li)
                break
    else:
        break
