import requests
import json

majorearningdata = {
    'education': 40050,
    'mathematics': 50340,
    'business_marketing': 50200,
    'communications_technology': 45260,
    'language': 40020,
    'visual_performing': 36270,
    'engineering_technology': 65480,
    'parks_recreation_fitness': 40080,
    'agriculture': 45330,
    'security_law_enforcement': 40900,
    'computer': 65440,
    'precision_production': 65480,
    'humanities': 40020,
    'library': 40280,
    'psychology': 40100,
    'social_science': 40030,
    'legal': 50330,
    'english': 40280,
    'construction': 48270,
    'military': 48270,
    'communication': 45260,
    'public_administration_social_service': 36200,
    'architecture': 48270,
    'ethnic_cultural_gender': 40030,
    'resources': 48270,
    'health': 56350,
    'engineering': 65480,
    'history': 43430,
    'theology_religious_vocation': 40050,
    'transportation': 48270,
    'physical_science': 49110,
    'science_technology': 60100,
    'biological': 45330,
    'family_consumer_science': 36200,
    'philosophy_religious': 40050,
    'personal_culinary': 48270,
    'multidiscipline': 43170,
    'mechanic_repair_technology': 71860
}

collegename = "Stanford University"
testmajor = 'computer'

url = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name={}&api_key=pjocLbVezV0ADpMYlUBYtNJYt4ObWiXtFiGgvnDr"

webdata = json.loads(requests.get(url.format(collegename.replace(" ","%20"))).text)['results'][0]['latest']

earnings = webdata['earnings']
majorratios = webdata['academics']['program_percentage']

idealavg = 0
for major in majorratios:
    try: idealavg += majorratios[major]*majorearningdata[major]
    except TypeError: pass

avgdata = {}

for year in earnings:
    try:
        if len(earnings[year])<2: continue
    except TypeError: continue

    try: avgdata.update({year: int(earnings[year]['mean_earnings'])})
    except (TypeError,KeyError): avgdata.update({year:0})
    if avgdata[year]>0: continue
    
    try: avgdata.update({year: int(earnings[year]['mean_earnings']['middle_tercile'])})
    except (TypeError,KeyError): avgdata.update({year:0})
    if avgdata[year]>0: continue

    try: avgdata.update({year: int(earnings[year]['median'])})
    except (TypeError,KeyError): avgdata.update({year:0})
    if avgdata[year]>0: continue

avgdata = list(avgdata.values())
avgdata = [x for x in avgdata if x>0]
actualavg = sum(avgdata)/len(avgdata)

scalefactor = actualavg/idealavg

print(majorratios)
print(idealavg)
print(actualavg)
print(scalefactor)

print("A {} major at {} would make {}".format(testmajor,collegename,round(scalefactor*majorearningdata[testmajor],2)))
