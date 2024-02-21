-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE IF NOT EXISTS holdings (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  ticker TEXT,
  amount REAL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE holdings;
-- +goose StatementEnd
