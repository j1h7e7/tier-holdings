import requests
import json

majorearningdata = json.loads(open("majordata.json").read())

collegename = "Harvard"
testmajor = 'engineering'

url = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name={}&api_key=pjocLbVezV0ADpMYlUBYtNJYt4ObWiXtFiGgvnDr"

webdata = json.loads(requests.get(url.format(collegename.replace(" ","%20"))).text)['results'][0]['latest']

earnings = webdata['earnings']
majorratios = webdata['academics']['program_percentage']

completion = webdata['completion']
gradrate = completion['completion_rate_4yr_200nt']

idealavg = 0
for major in majorratios:
    try: idealavg += majorratios[major]*majorearningdata[major]
    except TypeError: pass

avgdata = {}

for year in earnings:
    try:
        if len(earnings[year])<2: continue  # Check for no data
    except TypeError: continue

    try: avgdata.update({year: int(earnings[year]['mean_earnings'])}) # Look for a mean earnings entry
    except (TypeError,KeyError): avgdata.update({year:0})
    if avgdata[year]>0: continue
    
    try: avgdata.update({year: int(earnings[year]['mean_earnings']['middle_tercile'])}) # Look for a mean earnings/middle tercile entry
    except (TypeError,KeyError): avgdata.update({year:0})
    if avgdata[year]>0: continue

    try: avgdata.update({year: int(earnings[year]['median'])}) # Look for a median entry
    except (TypeError,KeyError): avgdata.update({year:0})
    if avgdata[year]>0: continue

avgdata = list(avgdata.values())
avgdata = [x for x in avgdata if x>0] # Remove years with no data
actualavg = sum(avgdata)/len(avgdata) # Take average

scalefactor = actualavg/idealavg # Multiplicative difference between ideal average and the actual average

print(majorratios)
print(idealavg)
print(actualavg)
print(scalefactor)

finalsalary = (scalefactor*majorearningdata[testmajor]+actualavg)/2

print("A {} major at {} would make {}".format(testmajor,collegename,round(finalsalary,2)))
