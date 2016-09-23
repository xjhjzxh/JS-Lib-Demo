using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(javascriptLibStudy.Startup))]
namespace javascriptLibStudy
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
