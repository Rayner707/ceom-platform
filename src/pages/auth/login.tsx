import Layout from "@/components/common/Layout";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Layout>
      <AuthForm isLogin={true} />
    </Layout>
  );
}