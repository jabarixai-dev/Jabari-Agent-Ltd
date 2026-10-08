export type OpportunityStage="discovered"|"researching"|"qualified"|"ready_for_outreach"|"contacted"|"engaged"|"appointment"|"won"|"lost"|"archived";
export type Opportunity={id:string;name:string;stage:OpportunityStage;score:number};
