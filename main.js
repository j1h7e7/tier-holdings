var majorearningdata = {
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
};

$( function() {
  $.ajax({
      url:'collegelist.txt',
      success: function (data){
        var collegelist = data.split();
      }
    });
    
    $( "#tags" ).autocomplete({
      source: collegelist
    });
  
  });