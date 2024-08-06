import { Router } from 'itty-router';

export interface Env {
	LIMIT_COUNTRIES: boolean;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const requestTime = Date.now();
		const router = Router();
		const clientContinent = request.cf?.continent;

		router.get('/', () => new Response('Should Redirect to page'));
		router.get('/send-lead/', () => new Response('Should Redirect to page'));

		router.post('/send-lead/', async (request) => {
			if (env.LIMIT_COUNTRIES === true && clientContinent !== 'EU') {
				console.log(env.LIMIT_COUNTRIES === true);
				return new Response(`Form is disabled for requests coming from ${clientContinent}`, { status: 403 });
			}
			const content = await request.json();
			await env.kvleads.put(requestTime, JSON.stringify(content));
			await env.kvleads.put(requestTime + '-meta', JSON.stringify([...request.headers]));

			return new Response('Merci pour votre message. Nous vous répondrons rapidement.');
		});

		router.all('*', () => new Response('Not Found.', { status: 404 }));

		return router.handle(request);
	},
} satisfies ExportedHandler<Env>;
