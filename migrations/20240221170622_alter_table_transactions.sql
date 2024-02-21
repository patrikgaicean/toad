-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE transactions
ADD side TEXT CHECK(side IN ('BUY', 'SELL'));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER TABLE transactions
DROP COLUMN side;
-- +goose StatementEnd
