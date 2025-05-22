import Layout from "@/components/common/Layout";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <Layout>
      <AuthForm isLogin={false} />
    </Layout>
  );
}