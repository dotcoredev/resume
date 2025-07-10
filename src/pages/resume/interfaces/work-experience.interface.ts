export interface IWorkExperience {
	name: string;
	period: string;
	company_name: string;
	url_company: string;
	sort: number;
	id: number;
	desc: string | (() => string);
}
