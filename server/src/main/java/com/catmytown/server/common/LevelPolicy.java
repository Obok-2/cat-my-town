package com.catmytown.server.common;

// 등록한 고양이 수로 레벨을 정한다(0은 미등록). 앱 src/data/levels.js 의 등급표와 같은 기준이다.
public final class LevelPolicy {

    public static final int MAX_LEVEL = 5;

    private LevelPolicy() {
    }

    public static int calculate(int catCount) {
        if (catCount >= 30) {
            return 5;
        }
        if (catCount >= 16) {
            return 4;
        }
        if (catCount >= 12) {
            return 3;
        }
        if (catCount >= 5) {
            return 2;
        }
        return catCount >= 1 ? 1 : 0;
    }

}
