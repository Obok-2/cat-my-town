package com.catmytown.server.common;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseApi {

    public enum RESULT {
        SUCCESS /* 성공 */, FAIL /* 업무 처리 실패 */, ERROR /* 시스템 오류 */
    }

    private RESULT result = RESULT.SUCCESS;

    private String message = "";

    private int code = 200;

    private Object data;

    public ResponseApi(RESULT result, String message, int code, Object data) {
        this.result = result;
        this.message = message;
        this.code = code;
        this.data = data;
    }

    public static ResponseApi success(Object data) {
        return new ResponseApi(RESULT.SUCCESS, "SUCCESS", 200, data);
    }

    public static ResponseApi fail(int code, String message) {
        return new ResponseApi(RESULT.FAIL, message, code, null);
    }

    public static ResponseApi error(String message) {
        return new ResponseApi(RESULT.ERROR, message, 500, null);
    }

}
