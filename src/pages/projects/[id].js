import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import ProjectForm from "@/components/ProjectForm";
import { fetchProjectById } from "@/redux/actions/projectActions";

function EditProjectPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;

  const currentProject = useSelector((s) => s.project.currentProject);
  const loading = useSelector((s) => s.project.loading);

  useEffect(() => {
    if (id) dispatch(fetchProjectById(id, router));
  }, [id]);

  if (!id || loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 12,
          color: "#9ca3af",
        }}
      >
        <div style={{ fontSize: 40 }}>⏳</div>
        <div>Loading project…</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 12,
          color: "#9ca3af",
        }}
      >
        <div style={{ fontSize: 40 }}>❌</div>
        <div style={{ color: "#374151", fontWeight: 600 }}>Project not found</div>
        <button
          onClick={() => router.push("/projects")}
          style={{
            padding: "8px 20px",
            background: "#078DD4",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit {currentProject.name} | Lotusss Admin</title>
      </Head>
      <ProjectForm initialData={currentProject} projectId={id} />
    </>
  );
}

export default isAuth(EditProjectPage);
