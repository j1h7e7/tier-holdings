from tkinter import *
import json
import requests
import re
from earningcalculator import getimportantinfo
import math
 
# Dictionary with options
colleges = open('collegelist.txt').readlines()
colleges = [c.strip() for c in colleges]
majors = list(json.loads(open('majordata.json').read()).keys())
majors.sort()

majorearningdata = json.loads(open("majordata.json").read())
majordropdata = json.loads(open("dropoutdata.json").read())
majordropdata = {m: 1-majordropdata[m]/100 for m in majordropdata}

textboxsize = 50

class AutocompleteEntry(Entry):
    def __init__(self, lista, *args, **kwargs):
        Entry.__init__(self, *args, **kwargs)
        self.lista = lista        
        self.var = self["textvariable"]
        if self.var == '':
            self.var = self["textvariable"] = StringVar()

        self.var.trace('w', self.changed)
        self.bind("<Right>", self.selection)
        self.bind("<Up>", self.up)
        self.bind("<Down>", self.down)
        
        self.lb_up = False

    def changed(self, name, index, mode):  
        if self.var.get() == '':
            self.lb.destroy()
            self.lb_up = False
        else:
            words = self.comparison()
            if words:            
                if not self.lb_up:
                    self.lb = Listbox(width=textboxsize)
                    self.lb.bind("<Double-Button-1>", self.selection)
                    self.lb.bind("<Right>", self.selection)
                    self.lb.place(x=self.winfo_x(), y=self.winfo_y()+self.winfo_height())
                    self.lb_up = True
                
                self.lb.delete(0, END)
                for w in words:
                    self.lb.insert(END,w)
            else:
                if self.lb_up:
                    self.lb.destroy()
                    self.lb_up = False
        
    def selection(self, event):
        if self.lb_up:
            self.var.set(self.lb.get(ACTIVE))
            self.lb.destroy()
            self.lb_up = False
            self.icursor(END)

    def up(self, event):
        if self.lb_up:
            if self.lb.curselection() == ():
                index = '0'
            else:
                index = self.lb.curselection()[0]
            if index != '0':                
                self.lb.selection_clear(first=index)
                index = str(int(index)-1)                
                self.lb.selection_set(first=index)
                self.lb.activate(index) 

    def down(self, event):
        if self.lb_up:
            if self.lb.curselection() == ():
                index = '0'
            else:
                index = self.lb.curselection()[0]
            if index != END:                        
                self.lb.selection_clear(first=index)
                index = str(int(index)+1)        
                self.lb.selection_set(first=index)
                self.lb.activate(index) 

    def comparison(self):
        pattern = re.compile('.*' + self.var.get() + '.*')
        return [w for w in self.lista if re.match(pattern, w)]

storeddata = {}

def calculate():
    selcol = college.get()
    selmajor = tkvar.get()

    if not selcol in storeddata:
        try: newdata = getimportantinfo(selcol)
        except IndexError:
            print("ERROR")
            return
        storeddata.update({selcol:newdata})

    e = (storeddata[selcol][0]*majorearningdata[selmajor]+storeddata[selcol][2])/2
    e = round(e,2)
    g = storeddata[selcol][1]*majordropdata[selmajor]
    g = 1-g

    earnings.config(text="Earnings: $"+str(e))
    dropout.config(text="Graduation Rate: "+"{0:.1%}".format(g))

    r = g/(1+math.e**((50-(e/1000))/10))

    rating.config(text="Rating: "+"{0:.2%}".format(r))

if __name__ == '__main__':
    root = Tk()
    root.title("Tier Holdings")

    root.grid_columnconfigure(0,minsize=500)

    college = AutocompleteEntry(colleges, root,width=textboxsize)
    college.grid(row=0, column=0,sticky='N')

    tkvar = StringVar(root)
    tkvar.set("select major")
    major = OptionMenu(root, tkvar, *majors)
    major.grid(row=1,column=0,sticky='N')

    b = Button(root, text="CALCULATE", command=calculate)
    b.grid(row=2,column=0,sticky='N')

    blankrows = 3
    for i in range(0,blankrows):
        Label(root,text="").grid(row=3+i,column=0)

    earnings = Label(root, text="Earnings: N/A")
    earnings.grid(row=2+blankrows,column=0)

    dropout = Label(root,text="Graduation Rate: N/A")
    dropout.grid(row=3+blankrows,column=0)

    rating = Label(root,text="Rating: ")
    rating.grid(row=4+blankrows,column=0)


    root.update()
    root.minsize(500, 200)

    root.mainloop()
