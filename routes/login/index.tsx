import Head from "@/components/Head.tsx";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div>
        <button class="btn">
          <a href="/login/github">
            Github
          </a>
        </button>
      </div>
    </>
  );
}
