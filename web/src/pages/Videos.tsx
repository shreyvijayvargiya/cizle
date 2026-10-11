import { Link } from "@tanstack/react-router";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { VideosTable } from "@/components/VideosTable";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/lib/api";

export function VideosPage() {
	const videos = useVideos();
	const newBtn = (
		<Button asChild>
			<Link to="/create">
				<Icon icon={PlusSignIcon} size={15} /> New video
			</Link>
		</Button>
	);
	return (
		<Page title="Videos" description="Every video you've generated. Click one to watch, download or reuse it." actions={newBtn} wide>
			<VideosTable data={videos.data || []} loading={videos.isLoading} emptyAction={newBtn} />
		</Page>
	);
}
