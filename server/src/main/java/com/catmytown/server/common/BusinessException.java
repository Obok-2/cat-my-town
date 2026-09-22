package com.catmytown.server.common;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getHttpStatus() {
        return code >= 400 && code < 600 ? code : 400;
    }

}
