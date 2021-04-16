deploy:
	aws s3 sync ./scripts s3://devtales.bucket.net/projects/asteroideatch-match/scripts --profile devtales --acl public-read
	aws s3 cp ./index.html s3://devtales.bucket.net/projects/asteroideatch-match/ --profile devtales --acl public-read
	aws s3 cp ./sounds s3://devtales.bucket.net/projects/asteroideatch-match/sounds --profile devtales --acl public-read
