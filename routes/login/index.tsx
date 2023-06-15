import Head from "@/components/Head.tsx";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div>
        <a href="/login/github">
          <button class="btn">
            Github
          </button>
        </a>
      </div>
    </>
  );
}
