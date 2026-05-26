import Head from "next/head";
import isAuth from "@/components/isAuth";
import ProjectForm from "@/components/ProjectForm";

function AddProjectPage() {
  return (
    <>
      <Head>
        <title>Add Project | Lotusss Admin</title>
      </Head>
      <ProjectForm />
    </>
  );
}

export default isAuth(AddProjectPage);
