export interface TextAmendment {
  id: string;
  petition_number: string;
  ordinance_number: string;
  title: string;
  filing_date: string;
  public_hearing_date: string;
  zoning_planning_committee_date: string;
  city_council_decision_date: string;
  effective_date: string;
  sort: number;
  status: string;
}

export interface TextAmendmentColumn {
  accessorKey: string;
  header: string;
  cell?: (info: any) => React.ReactNode;
}
