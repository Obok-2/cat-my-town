package com.catmytown.server.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseApi> handleBusiness(BusinessException e) {
        return ResponseEntity.status(e.getHttpStatus()).body(ResponseApi.fail(e.getCode(), e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseApi> handleException(Exception e) {
        log.error("처리되지 않은 예외", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseApi.error("서버 오류가 발생했습니다."));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception e, Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        ResponseApi response = statusCode.is5xxServerError()
                ? ResponseApi.error("서버 오류가 발생했습니다.")
                : ResponseApi.fail(statusCode.value(), messageOf(statusCode));
        return ResponseEntity.status(statusCode).headers(headers).body(response);
    }

    private String messageOf(HttpStatusCode statusCode) {
        int status = statusCode.value();
        if (status == 400) {
            return "잘못된 요청입니다.";
        }
        if (status == 404) {
            return "요청한 주소를 찾을 수 없습니다.";
        }
        if (status == 405) {
            return "지원하지 않는 요청 방식입니다.";
        }
        return "요청을 처리할 수 없습니다.";
    }

}
