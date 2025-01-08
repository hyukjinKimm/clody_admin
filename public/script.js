// DOM이 완전히 로드된 후 스크립트를 실행하도록 설정
document.addEventListener('DOMContentLoaded', function () {
    const queryButton = document.getElementById('run-query-btn'); // 버튼 요소 선택

    // 버튼이 없으면 이벤트 리스너를 추가할 수 없으므로 체크
    if (queryButton) {
        queryButton.addEventListener('click', async () => {
            const queryInput = document.getElementById('query');
            const query = queryInput.value.trim();

            // 쿼리가 비어있는 경우 처리
            if (!query) {
                alert('쿼리를 입력하세요!');
                return;
            }

            try {
                // 쿼리 전송
                const response = await fetch('/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                const data = await response.json();

                if (data.success) {
                    displayQueryResult(data.columns, data.rows); // 성공 시 결과 출력
                } else {
                    alert(data.message); // 실패 시 메시지 출력
                }
            } catch (error) {
                console.error('쿼리 실행 오류:', error);
                alert('쿼리 실행에 실패했습니다.');
            }
        });
    }
});

// 쿼리 결과를 표로 출력하는 함수
function displayQueryResult(columns, rows) {
    const resultContainer = document.getElementById('query-result');
    
    // 기존 결과 지우기
    resultContainer.innerHTML = '';

    if (rows.length === 0) {
        resultContainer.innerHTML = '<p>결과가 없습니다.</p>';
        return;
    }

    // 테이블 생성
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // 테이블 헤더 생성
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 테이블 본문 생성
    rows.forEach(row => {
        const rowElement = document.createElement('tr');
        columns.forEach((column, index) => {
            const td = document.createElement('td');
            td.textContent = row[index];
            rowElement.appendChild(td);
        });
        tbody.appendChild(rowElement);
    });

    // 테이블에 헤더와 본문 추가
    table.appendChild(thead);
    table.appendChild(tbody);

    // 결과 영역에 테이블 추가
    resultContainer.appendChild(table);
}
document.addEventListener('DOMContentLoaded', function () {
    const getDiaryCountButton = document.getElementById('get-diary-count-btn'); // 버튼 요소 선택

    // 버튼이 없으면 이벤트 리스너를 추가할 수 없으므로 체크
    if (getDiaryCountButton) {
        getDiaryCountButton.addEventListener('click', async () => {
            const userIdInput = document.getElementById('user-id-input-1');
            const userId = userIdInput.value.trim();

            // 유저 아이디가 비어있는 경우 처리
            if (!userId) {
                alert('유저 아이디를 입력하세요!');
                return;
            }

            try {
                // 유저 아이디를 기반으로 API 호출
                const response = await fetch(`/user-diary-count?userId=${userId}`);

                const data = await response.json();

                if (data.success) {
                    // 성공 시 일기 수 조회 결과 출력
                    displayDiaryCountResult(data.userId, data.diaryCount);
                } else {
                    alert(data.message); // 실패 시 메시지 출력
                }
            } catch (error) {
                console.error('일기 수 조회 오류:', error);
                alert('일기 수 조회에 실패했습니다.');
            }
        });
    }
});

// 유저 아이디와 일기 수를 표로 출력하는 함수
function displayDiaryCountResult(userId, count) {
    const resultContainer = document.getElementById('query-result');

    // 기존 결과 지우기
    resultContainer.innerHTML = '';

    // 결과가 없을 경우 처리
    if (count === undefined) {
        resultContainer.innerHTML = '<p>결과가 없습니다.</p>';
        return;
    }

    // 테이블 생성
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // 테이블 헤더 생성
    const headerRow = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.textContent = '유저 아이디';
    headerRow.appendChild(th1);

    const th2 = document.createElement('th');
    th2.textContent = '일기 수';
    headerRow.appendChild(th2);

    thead.appendChild(headerRow);

    // 테이블 본문 생성
    const rowElement = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = userId;
    rowElement.appendChild(td1);

    const td2 = document.createElement('td');
    td2.textContent = count;
    rowElement.appendChild(td2);

    tbody.appendChild(rowElement);

    // 테이블에 헤더와 본문 추가
    table.appendChild(thead);
    table.appendChild(tbody);

    // 결과 영역에 테이블 추가
    resultContainer.appendChild(table);
}
document.addEventListener('DOMContentLoaded', function () {
    const getDiaryButton = document.getElementById('get-diary-btn'); // 버튼 요소 선택

    // 버튼 클릭 시 일기 조회
    if (getDiaryButton) {
        getDiaryButton.addEventListener('click', async () => {
            const userIdInput = document.getElementById('user-id-input-2');
            const userId = userIdInput.value.trim(); // 입력된 유저 아이디

            // 유저 아이디가 비어있는 경우 처리
            if (!userId) {
                alert('유저 아이디를 입력하세요!');
                return;
            }

            try {
                // API 호출
                const response = await fetch('/get-diaries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }),
                });

                const data = await response.json();

                if (data.success) {
                    console.log(data.diaries)
                    displayDiariesResult(data.diaries); // 성공 시 결과 출력
                } else {
                    alert(data.message); // 실패 시 메시지 출력
                }
            } catch (error) {
                console.error('에러 발생:', error);
                alert('일기 조회에 실패했습니다.');
            }
        });
    }
});

// 유저의 모든 일기를 표로 출력하는 함수
function displayDiariesResult(diaries) {
    const resultContainer = document.getElementById('query-result');

    // 기존 결과 지우기
    resultContainer.innerHTML = '';

    // 일기가 없는 경우 처리
    if (!diaries || diaries.length === 0) {
        resultContainer.innerHTML = '<p>해당 유저의 일기가 없습니다.</p>';
        return;
    }

    // 테이블 생성
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // 테이블 헤더 생성 (diaries 배열의 첫 번째 객체의 키를 사용)
    const headerRow = document.createElement('tr');
    const columns = Object.keys(diaries[0]); // 첫 번째 일기의 키들
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 테이블 본문 생성 (diaries 배열의 각 객체를 사용)
    diaries.forEach(diary => {
        const rowElement = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = diary[column]; // 각 열의 데이터를 추출하여 추가
            rowElement.appendChild(td);
        });
        tbody.appendChild(rowElement);
    });

    // 테이블에 헤더와 본문 추가
    table.appendChild(thead);
    table.appendChild(tbody);

    // 결과 영역에 테이블 추가
    resultContainer.appendChild(table);
}

document.addEventListener('DOMContentLoaded', function () {
    const downloadExcelButton = document.getElementById('download-excel-btn'); // 엑셀 다운로드 버튼 선택

    // 버튼이 없으면 이벤트 리스너를 추가할 수 없으므로 체크
    if (downloadExcelButton) {
        downloadExcelButton.addEventListener('click', async () => {
            try {
                // 최근 쿼리 실행 결과를 다운로드 요청
                const response = await fetch('/download-excel');

                if (!response.ok) {
                    const data = await response.json();
                    alert(data.message || '엑셀 다운로드 실패');
                    return;
                }

                // 서버에서 엑셀 파일을 다운로드
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'query_result.xlsx';  // 파일 이름 설정
                link.click();
            } catch (error) {
                console.error('엑셀 다운로드 오류:', error);
                alert('엑셀 다운로드에 실패했습니다.');
            }
        });
    }
});
