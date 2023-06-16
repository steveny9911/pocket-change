import { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import Head from "@/components/Head.tsx";

export const handler: Handlers<State, State> = {
  GET(_request, ctx) {
    return ctx.render(ctx.state);
  },
};

export default function Home(props: PageProps<State>) {
  return (
    <>
      <Head href={props.url.href}>
        <title>
          Pocket Change<sup style="font-size: 1rem">*demo</sup>
        </title>
      </Head>
      <div style="display: flex; justify-content: right;">
        {props.data.sessionId
          ? (
            <a href="/my">
              <button class="btn">
                My
              </button>
            </a>
          )
          : (
            <a href="/login">
              <button class="btn">
                Login
              </button>
            </a>
          )}
      </div>
      <div style="display: flex; align-items: center; justify-content: center; text-align: center; min-height: 90vh;">
        <p style="font-size: 3rem; font-family: Chicago;">
          Pocket Change <sup style="font-size: 1.5rem">*demo</sup>
        </p>
      </div>

      <div style="display: flex; justify-content: right;">
        <a href="https://github.com/steveny9911/pocket-change">
          <button class="btn">
            Github
          </button>
        </a>
      </div>
    </>
  );
}
