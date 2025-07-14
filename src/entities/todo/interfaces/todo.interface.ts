export interface Todo {
	_id: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface TodoSocketEvent {
	event: string;
	data: Todo | { id: string };
	timestamp: string;
}

export interface TodoState {
	items: Todo[];
	loading: boolean;
	error: string | null;
	lastUpdate: string | null;
}
