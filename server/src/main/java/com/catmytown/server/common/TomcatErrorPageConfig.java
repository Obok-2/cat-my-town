package com.catmytown.server.common;

import org.apache.catalina.Container;
import org.apache.catalina.Context;
import org.apache.catalina.core.StandardHost;
import org.springframework.boot.web.embedded.tomcat.TomcatContextCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class TomcatErrorPageConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory>, TomcatContextCustomizer {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addContextCustomizers(this);
    }

    @Override
    public void customize(Context context) {
        Container parent = context.getParent();
        if (parent instanceof StandardHost) {
            ((StandardHost) parent).setErrorReportValveClass(HiddenErrorReportValve.class.getName());
        }
    }

}
