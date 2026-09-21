package com.catmytown.server.common;

import org.apache.catalina.valves.ErrorReportValve;

public class HiddenErrorReportValve extends ErrorReportValve {

    public HiddenErrorReportValve() {
        setShowServerInfo(false);
        setShowReport(false);
    }

}
