const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-yellow-900 via-orange-900 to-green-900">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 tracking-wide text-center">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
