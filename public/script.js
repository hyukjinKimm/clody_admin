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
