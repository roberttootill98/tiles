import { redirect } from "@sveltejs/kit";

export async function load(): Promise<void> {
    redirect(301, '/tiles');
}
